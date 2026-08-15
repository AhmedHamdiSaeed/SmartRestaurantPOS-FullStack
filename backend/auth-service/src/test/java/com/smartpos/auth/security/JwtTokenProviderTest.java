package com.smartpos.auth.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "very_secret_default_jwt_key_that_is_long_enough_for_hmac256_which_is_32_bytes_long");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationInMs", 86400000L);
    }

    @Test
    void generateToken_shouldContainExpectedClaims() {
        String token = jwtTokenProvider.generateToken("user-1", "john.doe", "CASHIER", "tenant-1");

        assertNotNull(token);

        Claims claims = jwtTokenProvider.getClaimsFromToken(token);
        assertEquals("john.doe", claims.getSubject());
        assertEquals("user-1", claims.get("userId"));
        assertEquals("CASHIER", claims.get("role"));
        assertEquals("tenant-1", claims.get("tenantId"));
    }

    @Test
    void validateToken_withValidToken_shouldReturnTrue() {
        String token = jwtTokenProvider.generateToken("user-1", "john.doe", "CASHIER", null);
        assertTrue(jwtTokenProvider.validateToken(token));
    }

    @Test
    void validateToken_withInvalidToken_shouldReturnFalse() {
        assertFalse(jwtTokenProvider.validateToken("invalid-token-string"));
    }

    @Test
    void getUsernameFromToken_shouldExtractCorrectly() {
        String token = jwtTokenProvider.generateToken("user-1", "john.doe", "CASHIER", null);
        assertEquals("john.doe", jwtTokenProvider.getUsernameFromToken(token));
    }
    
    @Test
    void validateToken_withExpiredToken_shouldReturnFalse() {
        // Set short expiration
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationInMs", -1000L);
        String token = jwtTokenProvider.generateToken("user-1", "john.doe", "CASHIER", null);
        
        assertFalse(jwtTokenProvider.validateToken(token));
    }
}
