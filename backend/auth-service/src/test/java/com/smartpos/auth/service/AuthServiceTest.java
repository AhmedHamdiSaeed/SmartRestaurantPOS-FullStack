package com.smartpos.auth.service;

import com.smartpos.auth.dto.*;
import com.smartpos.auth.exception.BadRequestException;
import com.smartpos.auth.model.RefreshToken;
import com.smartpos.auth.model.User;
import com.smartpos.auth.model.enums.UserRole;
import com.smartpos.auth.repository.RefreshTokenRepository;
import com.smartpos.auth.repository.UserRepository;
import com.smartpos.auth.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_withDefaultRole_shouldSaveCashier() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setPassword("password");
        request.setName("Test User");
        // No role set

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encoded");
        when(jwtTokenProvider.generateToken(any(), eq("testuser"), eq(UserRole.CASHIER.name()), any()))
                .thenReturn("access-token");
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("access-token", response.getToken());
        assertNotNull(response.getRefreshToken());
        assertEquals(UserRole.CASHIER, response.getUser().getRole());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals(UserRole.CASHIER, userCaptor.getValue().getRole());
    }

    @Test
    void register_withSuperAdminRole_shouldDefaultToCashier() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("adminwannabe");
        request.setPassword("password");
        request.setName("Admin Wannabe");
        request.setRole("SUPER_ADMIN");

        when(userRepository.existsByUsername("adminwannabe")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encoded");
        when(jwtTokenProvider.generateToken(any(), eq("adminwannabe"), eq(UserRole.CASHIER.name()), any()))
                .thenReturn("access-token");
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals(UserRole.CASHIER, response.getUser().getRole());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals(UserRole.CASHIER, userCaptor.getValue().getRole());
    }

    @Test
    void login_withValidCredentials_shouldReturnTokens() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        User user = User.builder()
                .id("1")
                .username("testuser")
                .password("encoded")
                .role(UserRole.MANAGER)
                .active(true)
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "encoded")).thenReturn(true);
        when(jwtTokenProvider.generateToken("1", "testuser", "MANAGER", null)).thenReturn("access-token");
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("access-token", response.getToken());
        assertNotNull(response.getRefreshToken());
    }

    @Test
    void login_withWrongPassword_shouldThrow() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("wrong");

        User user = User.builder()
                .id("1")
                .username("testuser")
                .password("encoded")
                .build();

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authService.login(request));
    }

    @Test
    void refreshToken_withValidToken_shouldReturnNewAccessToken() {
        User user = User.builder()
                .id("1")
                .username("testuser")
                .role(UserRole.CASHIER)
                .active(true)
                .build();

        RefreshToken token = RefreshToken.builder()
                .token("valid-refresh")
                .user(user)
                .revoked(false)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        when(refreshTokenRepository.findByToken("valid-refresh")).thenReturn(Optional.of(token));
        when(jwtTokenProvider.generateToken("1", "testuser", "CASHIER", null)).thenReturn("new-access-token");

        AuthResponse response = authService.refreshToken("valid-refresh");

        assertNotNull(response);
        assertEquals("new-access-token", response.getToken());
        assertEquals("valid-refresh", response.getRefreshToken());
    }

    @Test
    void refreshToken_withRevokedToken_shouldThrow() {
        RefreshToken token = RefreshToken.builder()
                .token("revoked-refresh")
                .revoked(true)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        when(refreshTokenRepository.findByToken("revoked-refresh")).thenReturn(Optional.of(token));

        assertThrows(BadRequestException.class, () -> authService.refreshToken("revoked-refresh"));
    }

    @Test
    void logout_shouldRevokeRefreshToken() {
        RefreshToken token = RefreshToken.builder()
                .token("valid-refresh")
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByToken("valid-refresh")).thenReturn(Optional.of(token));

        authService.logout("valid-refresh");

        assertTrue(token.isRevoked());
        verify(refreshTokenRepository).save(token);
    }
}
