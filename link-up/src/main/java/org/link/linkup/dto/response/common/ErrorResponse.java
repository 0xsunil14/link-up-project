package org.link.linkup.dto.response.common;

import lombok.*;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private String message;
    private Integer status;
    private Map<String, String> errors;
    private LocalDateTime timestamp;
}
