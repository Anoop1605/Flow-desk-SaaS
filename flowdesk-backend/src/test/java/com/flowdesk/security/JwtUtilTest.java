package com.flowdesk.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        // Set the expiration via reflection since it's a @Value field
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", 1000 * 60 * 60); // 1 hour
        userDetails = new User("testuser", "password", new ArrayList<>());
    }

    @Test
    void testGenerateAndExtractUsername() {
        String token = jwtUtil.generateToken(userDetails);
        assertNotNull(token);
        assertEquals("testuser", jwtUtil.extractUsername(token));
    }

    @Test
    void testValidateToken_Success() {
        String token = jwtUtil.generateToken(userDetails);
        assertTrue(jwtUtil.validateToken(token, userDetails));
    }

    @Test
    void testValidateToken_Failure_WrongUser() {
        String token = jwtUtil.generateToken(userDetails);
        UserDetails otherUser = new User("otheruser", "password", new ArrayList<>());
        assertFalse(jwtUtil.validateToken(token, otherUser));
    }

    @Test
    void testTokenExpiration() {
        // Set a very short expiration
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", -1000); // Expired 1 second ago
        String token = jwtUtil.generateToken(userDetails);
        
        // Validation should fail or throw exception depending on how Jwts handles expired tokens
        // In JwtUtil.validateToken it calls extractUsername which calls extractAllClaims 
        // which throws ExpiredJwtException.
        assertThrows(Exception.class, () -> jwtUtil.validateToken(token, userDetails));
    }
}
