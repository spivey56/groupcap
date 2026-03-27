package com.groupcap.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.groupcap.backend.entity.Response;

public interface ResponseRepository extends JpaRepository<Response, Long> {
	List<Response> findAllByEventId(String eventId);
}
