package com.groupcap.backend.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.groupcap.backend.service.EventService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {


    private final EventService eventService;

    @PostMapping
    public Map<String, Object> createEvent(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        var event = eventService.createEvent(name);
        return Map.of(
            "eventId", event.getId(),
            "publicUrl", "/e/" + event.getId(),
            "adminUrl", "/e/" + event.getId() + "/admin?key=" + event.getAdminKey()
        );
    }


    @PostMapping("/{eventId}/responses")
    public com.groupcap.backend.entity.Response submitResponse(
            @PathVariable String eventId,
            @RequestBody Map<String, Object> request) {
        Double amount = null;
        Object amountObj = request.get("amount");
        if (amountObj instanceof Number) {
            amount = ((Number) amountObj).doubleValue();
        } else if (amountObj instanceof String) {
            amount = Double.valueOf((String) amountObj);
        }
        return eventService.submitResponse(eventId, amount);
    }


    @GetMapping("/{eventId}/results")
    public Map<String, Object> getResults(@PathVariable String eventId, @RequestParam("key") String key) {
        return eventService.getResults(eventId, key);
    }

    @GetMapping("/{eventId}/name")
    public Map<String, String> getEventName(@PathVariable String eventId) {
        String name = eventService.getEventName(eventId);
        return Map.of("name", name);
    }
    // Get adminKey for a given event id
    @GetMapping("/{eventId}/adminkey")
    public Map<String, String> getAdminKey(@PathVariable String eventId) {
        String adminKey = eventService.getAdminKeyByEventId(eventId);
        return Map.of("adminKey", adminKey);
    }
}
