const { Router } = require('express');
const DragonTable = require('../models/dragon/table');
const { getWholeDragon, getPublicDragons } = require('../models/dragon/getDragons');
const { authenticatedAccount } = require('./sessionFunc');
const AccountDragonTable = require('../models/accountDragon/table');
const AccountTable = require('../models/account/table');
const Breeder = require('../models/dragon/breeder');

const router = new Router();

router.get('/new', (req, res, next) => {
    let accountId, dragon;
    const { sessionString } = req.cookies;
    authenticatedAccount({ sessionString })
        .then(({ account }) => {
            accountId = account.id;
            dragon = req.app.locals.engine.generation.newDragon({ accountId });
            return DragonTable.storeDragon(dragon);
        })
        .then(({ dragonId }) => {
            dragon.dragonId = dragonId;
            return AccountDragonTable.storeAccountDragon({ accountId, dragonId });
        })
        .then(() => {
            return res.json({ dragon })
        })
        .catch(error => next(error));;
});

router.get('/account-dragons', (req, res, next) => {
    authenticatedAccount({ sessionString: req.cookies.sessionString })
        .then(({ account }) => {
            return AccountDragonTable.getAccountDragons({ accountId: account.id })
        })
        .then(({ accountDragonIds }) => {
            return Promise.all(
                accountDragonIds.map(accountDragonId => {
                    return getWholeDragon({ dragonId: accountDragonId.dragonId });
                })
            );
        })
        .then(accountDragons => {
            return res.json({ accountDragons });
        })
        .catch(error => next(error));
});

router.put('/update', (req, res, next) => {
    const { dragonId, nickname, isPublic, saleValue, sireValue } = req.body;
    let sessionAccountId;

    authenticatedAccount({ sessionString: req.cookies.sessionString })
        .then(({ account }) => {
            sessionAccountId = account.id;
            return AccountDragonTable.getDragonAccount({ dragonId })
        })
        .then(({ accountId }) => {
            if (sessionAccountId !== accountId) {
                throw new Error('You donnot own this dragon!');
            }
            return DragonTable.updateDragon({ dragonId, nickname, isPublic, saleValue, sireValue })
        })
        .then(() => {
            res.json({
                info: {
                    type: 'success',
                    message: 'Dragon updated success!'
                }
            })
        })
        .catch(error => next(error));
});

router.get('/public-dragons', (req, res, next) => {
    getPublicDragons()
        .then(({ dragons }) => {
            return res.json({ dragons })
        })
        .catch(error => next(error));
});

router.post('/buy', (req, res, next) => {
    const { dragonId, saleValue } = req.body;
    let buyerId;

    DragonTable.getDragonWithoutTraits({ dragonId })
        .then(dragon => {
            if (dragon.saleValue !== saleValue) {
                throw new Error('Sale value is not correct!');
            }
            if (!dragon.isPublic) {
                throw new Error('Dragon is not public.')
            }
            return authenticatedAccount({ sessionString: req.cookies.sessionString })
        })
        .then(({ account }) => {
            if (!account) {
                throw new Error('Unauthenticated user.')
            }

            if (account.balance < saleValue) {
                throw new Error('Insufficient balance.')
            }
            buyerId = account.id;
            return AccountDragonTable.getDragonAccount({ dragonId })
        })
        .then(({ accountId }) => {
            if (accountId === buyerId) {
                throw new Error('Cannot buy your own dragon.')
            }

            const sellerId = accountId;

            return Promise.all([
                AccountTable.updateBalance({
                    accountId: buyerId,
                    value: -saleValue
                }),
                AccountTable.updateBalance({
                    accountId: sellerId,
                    value: saleValue
                }),
                AccountDragonTable.updateDragonAccount({
                    dragonId,
                    accountId: buyerId
                }),
                DragonTable.updateDragon({
                    dragonId,
                    isPublic: false
                })
            ])
        })
        .then(() => {
            res.json({
                info: {
                    type: 'success',
                    message: `Buy Dragon [Dragon id: ${dragonId}] success!`
                }
            })
        })
        .catch(error => next(error));
});

router.post('/mate', (req, res, next) => {
    const { matronDragonId, patronDragonId } = req.body;
    let babyDragon;
    if (matronDragonId === patronDragonId) {
        const error = new Error('Cannot breed with the same dragon!');
        return next(error);
    }

    let matronDragon, patronDragon;
    let matronAccountId, patronAccountId;

    getWholeDragon({ dragonId: patronDragonId })
        .then((dragon) => {
            if (!dragon.isPublic) {
                throw new Error('Mate Dragon must be public.')
            }
            patronDragon = dragon;
            return getWholeDragon({ dragonId: matronDragonId })
        })
        .then((dragon) => {
            matronDragon = dragon;
            return authenticatedAccount({ sessionString: req.cookies.sessionString })
        })
        .then(({ account }) => {
            if (!account) throw new Error('Not authenticated.')

            if (patronDragon.sireValue > account.balance) {
                throw new Error('Sire value exceeds balance.');
            }

            matronAccountId = account.id;
            return AccountDragonTable.getDragonAccount({ dragonId: patronDragonId })
        })
        .then(({ accountId }) => {
            patronAccountId = accountId;

            if (matronAccountId === patronAccountId) {
                throw new Error('Cannot breed your own dragons!');
            }

            const dragon = Breeder.breedDragon({ matron: matronDragon, patron: patronDragon });
            babyDragon = dragon;
            return DragonTable.storeDragon(dragon);
        })
        .then(({ dragonId }) => {
            babyDragon.dragonId = dragonId;
            Promise.all([
                AccountTable.updateBalance({
                    accountId: matronAccountId,
                    value: -patronDragon.sireValue
                }),
                AccountTable.updateBalance({
                    accountId: patronAccountId,
                    value: patronDragon.sireValue
                }),
                AccountDragonTable.storeAccountDragon({
                    dragonId,
                    accountId: matronAccountId
                })
            ])
        })
        .then(() => {
            res.json({
                info: {
                    type: 'success',
                    message: `Mate Dragon [Matron Dragon Id: ${matronDragonId}] and [Patron Dragon Id: ${patronDragonId}] success!`
                },
                babyDragon
            })
        })
        .catch(error => next(error));
});

module.exports = router;