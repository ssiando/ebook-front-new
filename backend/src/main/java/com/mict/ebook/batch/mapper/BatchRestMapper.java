package com.mict.ebook.batch.mapper;

import com.mict.ebook.batch.domain.BatchJob;
import com.mict.ebook.batch.dto.BatchResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BatchRestMapper {

    BatchResponse toResponse(BatchJob batchJob);
}
