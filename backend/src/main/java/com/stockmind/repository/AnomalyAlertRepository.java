package com.stockmind.repository;

import com.stockmind.entity.AnomalyAlertEntity;
import com.stockmind.enums.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnomalyAlertRepository extends JpaRepository<AnomalyAlertEntity, String> {

    List<AnomalyAlertEntity> findByStatusOrderByCreatedAtDesc(AlertStatus status);

    List<AnomalyAlertEntity> findAllByOrderByCreatedAtDesc();

    long countByStatus(AlertStatus status);
}
