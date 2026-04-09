package com.smartcampus.server.controller;

import com.smartcampus.server.model.Resource;
import com.smartcampus.server.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resources")
public class ResourceController {

    @Autowired
    private ResourceService service;

    // POST
    @PostMapping
    public Resource add(@RequestBody Resource resource) {
        return service.addResource(resource);
    }

    // GET ALL
    @GetMapping
    public List<Resource> getAll() {
        return service.getAllResources();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Resource getById(@PathVariable Long id) {
        return service.getResourceById(id);
    }

    // PUT
    @PutMapping("/{id}")
    public Resource update(@PathVariable Long id, @RequestBody Resource r) {
        return service.updateResource(id, r);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.deleteResource(id);
        return "Deleted Successfully";
    }

    @GetMapping("/filter")
    public List<Resource> filter(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) String location) {
        return service.filterResources(type, capacity, location);
    }

    // FILTER
    @GetMapping("/filter/type")
    public List<Resource> filter(@RequestParam String type) {
        return service.filterByType(type);
    }

    // FILTER BY CAPACITY
    @GetMapping("/filter/capacity")
    public List<Resource> filterByCapacity(@RequestParam int capacity) {
        return service.filterByCapacity(capacity);
    }

    // FILTER BY LOCATION
    @GetMapping("/filter/location")
    public List<Resource> filterByLocation(@RequestParam String location) {
        return service.filterByLocation(location);
    }
}
