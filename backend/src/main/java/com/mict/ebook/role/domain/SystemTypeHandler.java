package com.mict.ebook.role.domain;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

/** role.system 컬럼("VFX", "4DX" 등) <-> SystemType 매핑. name()이 아닌 value로 저장/조회한다. */
@MappedTypes(SystemType.class)
public class SystemTypeHandler extends BaseTypeHandler<SystemType> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, SystemType parameter, JdbcType jdbcType)
            throws SQLException {
        ps.setString(i, parameter.getValue());
    }

    @Override
    public SystemType getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : SystemType.from(value);
    }

    @Override
    public SystemType getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : SystemType.from(value);
    }

    @Override
    public SystemType getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : SystemType.from(value);
    }
}
