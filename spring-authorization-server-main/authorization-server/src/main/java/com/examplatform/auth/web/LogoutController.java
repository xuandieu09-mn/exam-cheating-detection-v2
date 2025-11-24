package com.examplatform.auth.web;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LogoutController {

    @GetMapping("/custom-logout")
    public String logout(HttpServletRequest request,
                        @RequestParam(value = "redirect_uri", required = false) String redirectUri) {
        
        // Perform logout
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            new SecurityContextLogoutHandler().logout(request, null, auth);
        }
        
        // Invalidate session
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        
        // Redirect to React client or provided redirect_uri
        String targetUrl = (redirectUri != null && !redirectUri.isEmpty()) 
                ? redirectUri 
                : "http://localhost:5173";
        
        System.out.println("[Custom Logout] Redirecting to: " + targetUrl);
        
        return "redirect:" + targetUrl;
    }
}
