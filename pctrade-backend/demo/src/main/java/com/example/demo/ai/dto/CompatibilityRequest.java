package com.example.demo.ai.dto;

import lombok.Data;
import java.util.List;

@Data
public class CompatibilityRequest {
    private List<String> components;
}