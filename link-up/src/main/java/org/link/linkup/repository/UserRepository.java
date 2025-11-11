package org.link.linkup.repository;

import org.link.linkup.dto.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    List<User> findByVerifiedTrue();
    
    boolean existsByEmail(String email);
    
    boolean existsByMobile(Long mobile);
    
    boolean existsByUsername(String username);
}