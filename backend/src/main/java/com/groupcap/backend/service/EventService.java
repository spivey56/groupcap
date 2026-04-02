package com.groupcap.backend.service;

import org.springframework.stereotype.Service;

import com.groupcap.backend.repository.EventRepository;
import com.groupcap.backend.repository.ResponseRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventService {
	private final EventRepository eventRepository;
	private final ResponseRepository responseRepository;

    // Create a method createEvent that takes a String name
    // It should:
    // - generate a UUID string for id
    // - generate a UUID string for adminKey
    // - set createdAt to now
    // - save and return the Event

	public com.groupcap.backend.entity.Event createEvent(String name) {
		java.util.UUID uuid = java.util.UUID.randomUUID();
		String id = uuid.toString();
		String adminKey = java.util.UUID.randomUUID().toString();
		java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
		com.groupcap.backend.entity.Event event = new com.groupcap.backend.entity.Event(id, name, adminKey, createdAt);
		return eventRepository.save(event);
	}

	// Create a method submitResponse that takes eventId and amount
	// It should:
	// - create a Response
	// - set eventId, amount, createdAt
	// - save and return it
	public com.groupcap.backend.entity.Response submitResponse(String eventId, Double amount) {
		com.groupcap.backend.entity.Response response = new com.groupcap.backend.entity.Response();
		response.setEventId(eventId);
		response.setAmount(amount);
		response.setCreatedAt(java.time.LocalDateTime.now());
		return responseRepository.save(response);
	}

	// Get adminKey by event id
	public String getAdminKeyByEventId(String eventId) {
		return eventRepository.findAdminKeyById(eventId);
	}

	// Create a method getResults that takes eventId and adminKey
	// Steps:
	// - find Event by id, throw exception if not found
	// - verify adminKey matches, otherwise throw exception
	// - get all responses for the event
	// - extract amounts into a list and sort
	// - calculate:
	//    - count
	//    - lowest value
	//    - median value
	public java.util.Map<String, Object> getResults(String eventId, String adminKey) {
		com.groupcap.backend.entity.Event event = eventRepository.findById(eventId)
			.orElseThrow(() -> new RuntimeException("Event not found"));
		if (!event.getAdminKey().equals(adminKey)) {
			throw new RuntimeException("Invalid admin key");
		}
		java.util.List<com.groupcap.backend.entity.Response> responses = responseRepository.findAllByEventId(eventId);
		java.util.List<Double> amounts = responses.stream()
			.map(com.groupcap.backend.entity.Response::getAmount)
			.sorted()
			.toList();
		int count = amounts.size();
		Double lowest = count > 0 ? amounts.get(0) : null;
		Double median = null;
		if (count > 0) {
			if (count % 2 == 1) {
				median = amounts.get(count / 2);
			} else {
				median = (amounts.get(count / 2 - 1) + amounts.get(count / 2)) / 2.0;
			}
		}
		java.util.Map<String, Object> result = new java.util.HashMap<>();
		result.put("name", event.getName());
		result.put("count", count);
		result.put("lowest", lowest);
		result.put("median", median);
		return result;
	}

	// Returns the name of the event by eventId
	public String getEventName(String eventId) {
		com.groupcap.backend.entity.Event event = eventRepository.findById(eventId)
			.orElseThrow(() -> new RuntimeException("Event not found"));
		return event.getName();
	}

	

}
