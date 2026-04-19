package com.smartcampus.server.model;

import jakarta.persistence.*;
import java.time.LocalTime;

import jakarta.persistence.OneToMany;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartcampus.server.entity.Booking;
import com.smartcampus.server.entity.Ticket;

import java.util.List;


@Entity
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resourceID;

    @OneToMany(mappedBy = "resource")
    @JsonIgnore
    private List<Booking> bookings;

    @OneToMany(mappedBy = "resource")
    @JsonIgnore
    private List<Ticket> tickets;

    

    private String name;
    private String type; // LAB, ROOM, EQUIPMENT
    private int capacity;
    private String location;

    private LocalTime availabilityStart;
    private LocalTime availabilityEnd;
    private String status; // ACTIVE / OUT_OF_SERVICE
    private String description;
    private String imageUrl;

    // Getters & Setters
    public Long getResourceID() { return resourceID; }
    public void setResourceID(Long resourceID) {
        this.resourceID = resourceID;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalTime getAvailabilityStart() { return availabilityStart; }
    public void setAvailabilityStart(LocalTime availabilityStart) { this.availabilityStart = availabilityStart; }

    public LocalTime getAvailabilityEnd() { return availabilityEnd; }
    public void setAvailabilityEnd(LocalTime availabilityEnd) { this.availabilityEnd = availabilityEnd; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    
}
