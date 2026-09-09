export function createAnalyticsChatRepository(db) {
  return {
    async executeReadQuery(sql) {
      const rows = await db.query(sql);
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      return {
        columns,
        rows,
        rowCount: rows.length,
      };
    },
  };
}
