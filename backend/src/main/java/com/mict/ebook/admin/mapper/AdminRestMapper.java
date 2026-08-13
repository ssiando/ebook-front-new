package com.mict.ebook.admin.mapper;

import com.mict.ebook.admin.domain.Admin;
import com.mict.ebook.admin.dto.AdminResponse;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AdminRestMapper {

    AdminResponse toResponse(Admin admin, List<Long> roleIds, List<String> groupCodes);
}
