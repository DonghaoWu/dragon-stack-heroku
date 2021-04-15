const db = require('../../../databaseConnection');
const TraitTable = require('../trait/table');

class DragonTraitTable {
    static storeDragonTrait({ dragonId, traitType, traitValue }) {
        return new Promise((resolve, reject) => {
            TraitTable.getTraitId({ traitType, traitValue })
                .then(({ traitId }) => {
                    db.query(
                        `INSERT INTO dragonTrait("traitId", "dragonId") VALUES($1, $2)`,
                        [traitId, dragonId],
                        (error, response) => {
                            if (error) return reject(error);

                            resolve({ dragonId })
                        }
                    )
                })
        })
    }

    static getDragonTraits({ dragonId }) {
        return new Promise((resolve, reject) => {
            db.query(
                `
                SELECT "traitType", "traitValue"
                FROM trait
                INNER JOIN dragonTrait ON trait.id = dragonTrait."traitId"
                WHERE dragonTrait."dragonId" = $1
                `,
                [dragonId],
                (error, response) => {
                    if (error) return reject(error);
                    resolve(response.rows);
                }
            )
        })
    }
}

module.exports = DragonTraitTable;

