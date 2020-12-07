export const browserDBInstance = (db) => {

    return {
      executeSql: (sql, params) => {
          
        return new Promise((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(sql, params, (tx, rs) => {
              resolve(rs);
            }, (tx, rs) => {
            console.log(sql, rs)
            });
          });
        })
      },
      sqlBatch: (arr) => {
        return new Promise((r, rr) => {
          let batch = [];
          db.transaction((tx) => {
            for (let i = 0; i < arr.length; i++) {
              batch.push(new Promise((resolve, reject) => {
                tx.executeSql(arr[i], [], () => { resolve(true) })
              }))
              Promise.all(batch).then(() => r(true));
            }
          });
        })
      }
    }
  }