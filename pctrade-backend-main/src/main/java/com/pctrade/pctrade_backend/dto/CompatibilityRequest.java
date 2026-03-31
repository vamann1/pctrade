package com.pctrade.pctrade_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class CompatibilityRequest {
    private List<String> components;
}