package com.smartcampus.server.controller;

import com.smartcampus.server.model.Resource;
import com.smartcampus.server.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;
import java.nio.file.*;

@RestController
@CrossOrigin(origins = "*")
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

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        Map<String, Object> data = new HashMap<>();
        data.put("total", service.countAll());
        data.put("active", service.countByStatus("ACTIVE"));
        data.put("inactive", service.countByStatus("OUT_OF_SERVICE"));
        data.put("types", service.countDistinctTypes());
        return data;
    }

    

    @PostMapping("/upload")
    public String uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String folder = "uploads/";
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            Path path = Paths.get(folder + filename);
            Files.createDirectories(path.getParent());
            Files.write(path, file.getBytes());

            return "http://localhost:8080/uploads/" + filename;

        } catch (Exception e) {
            return "Upload failed";
        }
    }
}
