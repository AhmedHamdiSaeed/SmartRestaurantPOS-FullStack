package com.smartpos.auth.service;

import com.smartpos.auth.dto.*;
import com.smartpos.auth.exception.BadRequestException;
import com.smartpos.auth.exception.ResourceNotFoundException;
import com.smartpos.auth.model.RefreshToken;
import com.smartpos.auth.model.User;
import com.smartpos.auth.model.enums.UserRole;
import com.smartpos.auth.repository.RefreshTokenRepository;
import com.smartpos.auth.repository.UserRepository;
import com.smartpos.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        UserRole role = UserRole.CASHIER;
        if (request.getRole() != null) {
            try {
                UserRole requestedRole = UserRole.valueOf(request.getRole().toUpperCase());
                if (requestedRole == UserRole.CASHIER || requestedRole == UserRole.WAITER) {
                    role = requestedRole;
                }
            } catch (Exception ignored) {}
        }

        // TODO: Accept tenantId only if caller is ADMIN/SUPER_ADMIN. Accepting from request body for MVP.
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .tenantId(request.getTenantId())
                .role(role)
                .branch(request.getBranch() != null ? request.getBranch() : "Riyadh Main")
                .avatar("👨‍🍳")
                .active(true)
                .emailVerified(false)
                .build();

        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name(), user.getTenantId());
        String refreshToken = createAndSaveRefreshToken(user);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400)
                .user(mapToDto(user))
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid username or password");
        }
        
        if (!user.isActive()) {
            throw new BadRequestException("User account is inactive");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name(), user.getTenantId());
        String refreshToken = createAndSaveRefreshToken(user);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400)
                .user(mapToDto(user))
                .build();
    }
    
    @Transactional
    public AuthResponse refreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));
                
        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Refresh token is expired or revoked");
        }
        
        User user = refreshToken.getUser();
        if (!user.isActive()) {
            throw new BadRequestException("User account is inactive");
        }
        
        String newAccessToken = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name(), user.getTenantId());
        
        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(86400)
                .user(mapToDto(user))
                .build();
    }
    
    @Transactional
    public void logout(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }

    public UserDto getCurrentUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToDto(user);
    }
    
    private String createAndSaveRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plusDays(30))
                .createdAt(LocalDateTime.now())
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .tenantId(user.getTenantId())
                .username(user.getUsername())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .active(user.isActive())
                .branch(user.getBranch())
                .avatar(user.getAvatar())
                .build();
    }
}
