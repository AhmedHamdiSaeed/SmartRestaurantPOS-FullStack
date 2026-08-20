package com.smartpos.auth.config;

import com.smartpos.auth.model.User;
import com.smartpos.auth.model.enums.UserRole;
import com.smartpos.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .name("Admin User")
                    .role(UserRole.MANAGER)
                    .branch("Riyadh Main")
                    .avatar("👔")
                    .active(true)
                    .emailVerified(true)
                    .build());

            userRepository.save(User.builder()
                    .username("cashier1")
                    .password(passwordEncoder.encode("pass123"))
                    .name("Sara Ahmad")
                    .role(UserRole.CASHIER)
                    .branch("Riyadh Main")
                    .avatar("💳")
                    .active(true)
                    .emailVerified(true)
                    .build());

            userRepository.save(User.builder()
                    .username("kitchen1")
                    .password(passwordEncoder.encode("pass123"))
                    .name("Omar Hassan")
                    .role(UserRole.KITCHEN)
                    .branch("Riyadh Main")
                    .avatar("👨‍🍳")
                    .active(true)
                    .emailVerified(true)
                    .build());

            userRepository.save(User.builder()
                    .username("support1")
                    .password(passwordEncoder.encode("pass123"))
                    .name("Layla Mohamed")
                    .role(UserRole.SUPPORT)
                    .branch("Riyadh Main")
                    .avatar("🎧")
                    .active(true)
                    .emailVerified(true)
                    .build());

            userRepository.save(User.builder()
                    .username("manager1")
                    .password(passwordEncoder.encode("pass123"))
                    .name("Khalid Al-Rashid")
                    .role(UserRole.MANAGER)
                    .branch("Jeddah Branch")
                    .avatar("👔")
                    .active(true)
                    .emailVerified(true)
                    .build());
        }
    }
}
