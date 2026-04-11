package com.smartcampus.server.controller;

import com.smartcampus.server.dto.CreateStaffUserRequest;
import com.smartcampus.server.dto.StaffAccountResponse;
import com.smartcampus.server.dto.RoleUpdateRequest;
import com.smartcampus.server.dto.UserDTO;
import com.smartcampus.server.service.UserService;
import jakarta.validation.Valid;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<UserDTO> updateRole(@PathVariable Long userId,
                                              @Valid @RequestBody RoleUpdateRequest request) {
        return ResponseEntity.ok(userService.updateRole(userId, request.getRole()));
    }

    @PostMapping("/staff")
public ResponseEntity<StaffAccountResponse> createStaff(
        @Valid @RequestBody CreateStaffUserRequest request) {

    return ResponseEntity.status(HttpStatus.CREATED)
            .body(userService.createStaffUser(request));
}
}
