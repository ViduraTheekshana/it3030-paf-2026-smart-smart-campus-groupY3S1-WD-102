package com.smartcampus.server.service;

import com.smartcampus.server.model.AuthProvider;
import com.smartcampus.server.model.Role;
import com.smartcampus.server.model.User;
import com.smartcampus.server.repository.UserRepository;
import java.util.Map;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class OAuth2UserServiceImpl extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public OAuth2UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = registrationId.equals("facebook")
                ? (String) attributes.get("email")
                : (String) attributes.get("email");

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Email was not provided by the OAuth provider.");
        }

        String fullName = registrationId.equals("facebook")
                ? (String) attributes.getOrDefault("name", email)
                : (String) attributes.getOrDefault("name", email);

        String providerId = registrationId.equals("facebook")
                ? String.valueOf(attributes.get("id"))
                : String.valueOf(attributes.get("sub"));

        AuthProvider provider = registrationId.equalsIgnoreCase("facebook") ? AuthProvider.FACEBOOK : AuthProvider.GOOGLE;

        User user = userRepository.findByEmail(email.toLowerCase()).orElseGet(User::new);
        user.setEmail(email.toLowerCase());
        user.setFullName(fullName);
        user.setProvider(provider);
        user.setProviderId(providerId);
        if (user.getRole() == null) {
            user.setRole(Role.ROLE_USER);
        }
        user.setEnabled(true);
        userRepository.save(user);

        return new DefaultOAuth2User(
                java.util.List.of(() -> user.getRole().name()),
                attributes,
                "email"
        );
    }
}
