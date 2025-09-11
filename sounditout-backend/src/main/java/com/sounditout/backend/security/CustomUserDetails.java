package com.sounditout.backend.security;

import com.sounditout.backend.domainLayer.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {

    private final User user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Keep existing behavior to avoid impacting other endpoints
        return List.of(new SimpleGrantedAuthority(user.getRole().name()));
    }

    @Override
    public String getUsername() {
        // You’re using email for login — keep as-is
        return user.getEmail();
    }

    @Override
    public String getPassword() {
        return user.getPassword(); // BCrypt hashed
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    /** Existing accessor used by your controllers/services. */
    public Long getId() {
        return user.getId();
    }

    /** Convenience alias so you can call getUserId() in controllers if you prefer. */
    public Long getUserId() {
        return user.getId();
    }

    /** Optional: expose the role name for quick checks/logging (e.g., "STUDENT" / "ADMIN"). */
    public String getRoleName() {
        return user.getRole().name();
    }

    /** Optional: expose the underlying User if you ever need more fields. */
    public User getUser() {
        return this.user;
    }
}
