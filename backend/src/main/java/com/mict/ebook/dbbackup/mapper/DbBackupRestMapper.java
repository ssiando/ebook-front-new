package com.mict.ebook.dbbackup.mapper;

import com.mict.ebook.dbbackup.domain.DbBackup;
import com.mict.ebook.dbbackup.dto.DbBackupResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DbBackupRestMapper {

    DbBackupResponse toResponse(DbBackup dbBackup);
}
