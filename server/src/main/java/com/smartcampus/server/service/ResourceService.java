package com.smartcampus.server.service;

import com.smartcampus.server.model.Resource;
import com.smartcampus.server.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository repo;

    public Resource addResource(Resource resource) {
        return repo.save(resource);
    }

    public List<Resource> getAllResources() {
        return repo.findAll();
    }

    public Resource getResourceById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public Resource updateResource(Long id, Resource newData) {
    Resource r = repo.findById(id).orElse(null);

    if (r != null) {
        r.setName(newData.getName());
        r.setType(newData.getType());
        r.setCapacity(newData.getCapacity());
        r.setLocation(newData.getLocation());
        r.setAvailabilityStart(newData.getAvailabilityStart()); // new
        r.setAvailabilityEnd(newData.getAvailabilityEnd());     // new
        r.setStatus(newData.getStatus());
        r.setDescription(newData.getDescription());
        r.setImageUrl(newData.getImageUrl());
        return repo.save(r);
    }
    return null;
}

    public void deleteResource(Long id) {
        repo.deleteById(id);
    }

    public List<Resource> filterResources(String type, Integer capacity, String location) {
        return repo.findAll().stream()
                .filter(r -> type == null || r.getType().equalsIgnoreCase(type))
                .filter(r -> capacity == null || r.getCapacity() >= capacity)
                .filter(r -> location == null || r.getLocation().equalsIgnoreCase(location))
                .toList();
    }

    public List<Resource> filterByType(String type) {
        return repo.findByType(type);
    }

    
    public List<Resource> filterByCapacity(int capacity) {
        return repo.findByCapacityGreaterThanEqual(capacity);
    }


    public List<Resource> filterByLocation(String location) {
        return repo.findByLocation(location);
    }

    public long countAll() {
        return repo.count();
    }

    public long countByStatus(String status) {
        return repo.findAll().stream()
                .filter(r -> r.getStatus().equalsIgnoreCase(status))
                .count();
    }

    public Map<String, Long> countByType() {
        return repo.findAll().stream()
                .collect(Collectors.groupingBy(Resource::getType, Collectors.counting()));
    }

    public long countDistinctTypes() {
        return repo.findAll().stream()
                .map(Resource::getType)
                .distinct()
                .count();
    }
}
