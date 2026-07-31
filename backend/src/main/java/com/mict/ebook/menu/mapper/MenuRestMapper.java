package com.mict.ebook.menu.mapper;

import com.mict.ebook.menu.domain.Menu;
import com.mict.ebook.menu.dto.MenuResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MenuRestMapper {

    MenuResponse toResponse(Menu menu);
}
