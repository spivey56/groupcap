package com.groupcap.backend.repository;

import com.groupcap.backend.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, String> {
	// Custom query to fetch adminKey by event id
	@org.springframework.data.jpa.repository.Query("SELECT e.adminKey FROM Event e WHERE e.id = :id")
	String findAdminKeyById(@org.springframework.data.repository.query.Param("id") String id);
}
