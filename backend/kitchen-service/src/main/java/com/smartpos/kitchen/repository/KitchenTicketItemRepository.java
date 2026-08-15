package com.smartpos.kitchen.repository;

import com.smartpos.kitchen.model.KitchenTicketItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KitchenTicketItemRepository extends JpaRepository<KitchenTicketItem, String> {}
