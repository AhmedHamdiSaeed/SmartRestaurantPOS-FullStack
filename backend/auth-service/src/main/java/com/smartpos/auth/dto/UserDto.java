package com.smartpos.auth.dto;

import com.smartpos.auth.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private String id;
    private String tenantId;
    private String username;
    private String email;
    private boolean active;
    private String name;
    private UserRole role;
    private String branch;
    private String avatar;
}
