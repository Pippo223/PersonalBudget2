const envelopeRouter = require('express').Router();
const pool = require('../db/dbConfig');

/**
 * @swagger
 * /api/envelopes:
 *    get:
 *      summary: Get all envelopes
 *      produces:
 *        - application/json
 *      tags:
 *        - Envelopes
 *      responses:
 *        "200":
 *          description: Returns a list of all envelopes
 *
 */
 envelopeRouter.get('/', async (req, res) => {
    try {
        const envelopes = await pool.query('SELECT * FROM envelopes ORDER BY id');
        if (envelopes.rowCount < 1) {
            return res.status(404).send({
                message: "There are no envelopes"
            });
        };
        res.status(200).send({
            status: 'Success',
            message: 'envelope information retrieved!',
            data: envelopes.rows,
        });
    } catch (err) {
        console.error(err.message);
    };
});

/**
 * @swagger
 * /api/envelopes/{id}:
 *   get:
 *     summary: Get an envelope by ID
 *     produces:
 *      - application/json
 *     tags:
 *      - envelopes
 *     parameters:
 *      - in : path
 *        name: id
 *        description: envelope id
 *        type: integer
 *        required: true
 *        example: 1
 *     responses:
 *      "200":
 *        description: Returns an envelope with its details
 *      "404":
 *        description: Envelope not found
 *      "500":
 *        description: Internal server error
 */
 envelopeRouter.get('/:envelopeId', async (req, res) => {
    try {
        const { envelopeId } = req.params;
        const envelope = await pool.query('SELECT * FROM envelopes WHERE id = $1', [envelopeId]);
        if (envelope.rowCount < 1) {
            return res.status(404).send({
                message: "There is no envelope with this id"
            });
        };
        res.status(200).send({
            status: 'Sucess',
            message: 'Envelope information retrieved!',
            data: envelope.rows[0]
        });
    } catch (error) {
        console.error(error.message);
    };
});

/**
 * @swagger
 * /api/envelopes:
 *   post:
 *     summary: Creates a new envelope
 *     produces:
 *       - application/json
 *     tags:
 *       - envelopes
 *     requestBody:
 *       description: Data for the new enveloppe
 *       required: true
 *       content:
 *         application/json:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *              budget:
 *                type: integer
 *            example:
 *              title: Restaurant
 *              budget: 90
 *     responses:
 *       "201":
 *         description: Returns created enveloppe
 *       "500":
 *         description: Internal server error
 */
 envelopeRouter.post('/', async (req, res) => {
    try {
        const { title, budget } = req.body;
        const newEnvelope = await pool.query('INSERT INTO envelopes (title, budget) VALUES ($1, $2) RETURNING *', 
        [title, budget]);
        res.status(201).send({
            status: 'Sucess',
            message: 'New envelope created!',
            data: newEnvelope.rows[0]
        });
    } catch (error) {
        console.error(error.message);
    };
});

/**
 * @swagger
 * /api/envelopes/{id}:
 *   put:
 *     summary: Updates an existing enveloppe
 *     produces:
 *        - application/json
 *     tags: 
 *        - envelopes
 *     parameters:
 *        - in: path
 *          name: id
 *          description: envelope ID to update
 *          type: integer
 *          required: true
 *          example: 1
 *     requestBody:
 *       description: New data for the existing enveloppe
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: object
 *              properties:
 *                title:
 *                  type: string
 *                budget:
 *                  type: integer
 *              example:
 *                title: Surf lesson
 *                budget: 150
 *     responses:
 *       "201":
 *         description: Returns updated envelope
 *       "404":
 *         description: Envelope not found
 *       "500": 
 *         description: Internal server error
 */
 envelopeRouter.put('/:envelopeId', async (req, res) => {
    try {
        const { envelopeId } = req.params;
        const { title, budget } = req.body;
        const updatedEnvelope = await pool.query('UPDATE envelopes SET title = $1, budget = $2 WHERE id = $3', 
        [title, budget, envelopeId]);
        res.status(200).send({
            status: 'Sucess',
            message: 'The enveloppe has been updated!',
            data: updatedEnvelope.rows[0]
        });
    } catch (error) {
        console.error(error.message);
    };
}); 

/**
 * @swagger
 * /api/envelopes/{id}:
 *   delete:
 *     summary: Deletes an specific envelope
 *     produces: 
 *       - application/json
 *     tags: 
 *       - envelopes
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Envelope ID to delete
 *         type: integer
 *         required: true
 *         example: 1
 *     responses:
 *       "204":
 *         description: Envelope deleted
 *       "404":
 *         description: Envelope not found
 *       "500":
 *         description: Internal server error
 */
 envelopeRouter.delete('/:envelopeId', async (req, res) => {
    try {
        const { envelopeId } = req.params;
        const envelope = await pool.query('SELECT * FROM envelopes WHERE id = $1', [envelopeId]);
        if (envelope.rowCount < 1) {
            return res.status(404).send({
                message: "There is no envelope with this id"
            });
        };
        
        await pool.query('DELETE FROM envelopes WHERE id = $1', [envelopeId]);
        res.sendStatus(204); 
    } catch (error) {
        console.error(error.message);
    };
});

/**
 * @swagger
 * /api/envelope/transfer/{from}/{to}:
 *   post:
 *     summary: Transfer an amount from a specific enveloppe to another one
 *     produces:
 *        - application/json
 *     tags: 
 *        - envelope
 *     parameters:
 *        - in: path
 *          name: from
 *          description: enveloppe id (from)
 *          type: integer
 *          required: true
 *          example: 1
 *        - in: path
 *          name: to
 *          description: enveloppe id (to)
 *          type: integer
 *          required: true
 *          example: 2
 *     requestBody:
 *         description: Amount to transfer
 *         required: true
 *         content:
 *            application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  amount:
 *                    type: integer
 *                example:
 *                  amount: 10
 *     responses:
 *        "201":
 *          description: Returns updated envelope
 *        "404":
 *          description: envelope not found
 *        "500":
 *          desription: Internal server error
 */
envelopeRouter.post('/transfer/:from/:to', async (req, res) => {
    try {
        const { from, to } = req.params;
        const { amount } = req.body;
        await pool.query('UPDATE envelope SET budget = budget - $1 WHERE id = $2', [amount, from]);
        await pool.query('UPDATE envelope SET budget = budget + $1 WHERE id = $2', [amount, to]);
        res.json(`The budget of the envelope number ${from} and ${to} have been successfully updated`);
    } catch (error) {
        console.error(error.message);
    };
});   


module.exports = envelopeRouter;