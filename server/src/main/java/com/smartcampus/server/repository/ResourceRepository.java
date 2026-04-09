package com.smartcampus.server.repository;

import com.smartcampus.server.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByType(String type);
    List<Resource> findByCapacityGreaterThanEqual(int capacity);
    List<Resource> findByLocation(String location);
}
