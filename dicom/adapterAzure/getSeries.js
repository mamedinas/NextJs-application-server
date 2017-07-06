import queryTableAll from './helpers/queryTableAll';

export default async ({ studyUID }) => {
    const values = await queryTableAll({
        tableName: `${process.env.APPSETTING_CONTAINER}Series`,
        select: ['seriesName', 'seriesUID']
    });

    console.log('series', values);
    return values;
};