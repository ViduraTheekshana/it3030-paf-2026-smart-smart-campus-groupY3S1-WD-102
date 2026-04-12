package com.smartcampus.server.dto.request;

import com.smartcampus.server.enums.TicketCategory;
import com.smartcampus.server.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateTicketRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    private String preferredContact;

    private Long resourceId;
}
