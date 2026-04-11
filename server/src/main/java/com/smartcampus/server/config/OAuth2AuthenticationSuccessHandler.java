package com.smartcampus.server.config;

import com.smartcampus.server.model.User;
import com.smartcampus.server.repository.UserRepository;
import com.smartcampus.server.security.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final UserDetailsService userDetailsService;

    @Value("${app.oauth2.authorizedRedirectUri}")
    private String redirectUri;

    public OAuth2AuthenticationSuccessHandler(JwtService jwtService,
                                              UserRepository userRepository,
                                              UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ServletException("OAuth user not found after login."));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails, Map.of(
                "role", user.getRole().name(),
                "userId", user.getUserId()
        ));

        String targetUrl = redirectUri
                + "?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8)
                + "&email=" + URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8)
                + "&role=" + URLEncoder.encode(user.getRole().name(), StandardCharsets.UTF_8);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
