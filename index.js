'use strict';

const _ = require('lodash');
const fs = require('fs');
const xlsx = require('xlsx');
const slugs = require('slugs');

const parties = new Set();

const excelsheet = xlsx.readFile('./LokShaba 2019 TN Candidate Vote Shares.ods', {
  type: 'file'
});

let jsonDump = [];
let constituencies = [];

let partyStats = [];

_.each(excelsheet.Sheets, (sheet, constituency) => {

  if (constituency === 'Collated') {
    return; // for report generationc
  }

  console.log('constituency => ', constituency);

  _.each(xlsx.utils.sheet_to_json(sheet), (row) => {
    let serialNo = row['O.S.N.'];
    if (!serialNo) {
      // serialNo will be undefined for total
      return;
    }

    const partyName = row['Party'];

    if (partyName !== 'Independent' && partyName !== 'None of the Above') {
      parties.add(partyName);
    }

    jsonDump.push({
      no: serialNo,
      constituency,
      candidate_name: row['Candidate'],
      party_name: partyName,
      evm_vote_count: parseInt(row['EVM Votes']),
      postal_vote_count: parseInt(row['Postal Votes']),
      total_vote_count: parseInt(row['Total Votes']),
      percentage_total_vote: parseFloat(row['% of Votes']),
    });

  });

  const constituencyWise = jsonDump.filter(item => item.constituency === constituency);

  constituencyWise.sort((party1, party2) => {
    return party2.total_vote_count - party1.total_vote_count;
  });

  const winningParty = constituencyWise[0];
  const runnerParty = constituencyWise[1];

  const VoteStats = constituencyWise.reduce((acc, value, key) => {

    acc.evm_vote_count = acc.evm_vote_count + value.evm_vote_count;
    acc.postal_vote_count = acc.postal_vote_count + value.postal_vote_count;
    acc.total_vote_count = acc.total_vote_count + value.total_vote_count;

    return acc;
  }, {
    evm_vote_count: 0,
    postal_vote_count: 0,
    total_vote_count: 0
  });

  const top5 = constituencyWise.slice(0, 5);

  for (let i = 0; i < top5.length; i++) {
    let result = top5[i];
    partyStats.push({
      position: i + 1,
      party_name: result.party_name,
      constituency_name: result.constituency,
    });
  }

  constituencies.push({
    constituency_slug: slugs(constituency),
    constituency_name: constituency,

    poll_results: constituencyWise,

    candidate_stats: {
      total_contestant: constituencyWise.length,
      total_parties: constituencyWise.filter(item => {
        return item.party_name.toLowerCase() !== 'independent' && item.party_name.toLowerCase() !== 'none of the above';
      }).length,
      total_independent: constituencyWise.filter(item => item.party_name.toLowerCase() === 'independent').length,
      nota: 1
    },

    poll_stats: {
      winning_candidate_name: winningParty.candidate_name,
      winning_party_slug: slugs(winningParty.party_name),
      win_margin: winningParty.total_vote_count - runnerParty.total_vote_count,
      winner_vote_count: winningParty.total_vote_count,
      runner_vote_count: runnerParty.total_vote_count,
      winning_party_name: winningParty.party_name,
      running_party_name: runnerParty.party_name,
      winning_vote_percent: ((winningParty.total_vote_count / VoteStats.total_vote_count) * 100).toFixed(2),
      top_5: top5,
    },

    vote_stats: VoteStats,
  });

});


fs.writeFile('./docs/data/formatted_data.json', JSON.stringify(constituencies), (err) => {
  if (err) {
    console.log(err);
    process.exit(0);
  }
  console.log('Successfully Written election stats formatted_data.json');
});

let stats = _.groupBy(partyStats, 'party_name');
let partyPosition = [];

for (let partyName of Object.keys(stats)) {

  let positionStats = stats[partyName];
  let groupedByPosition = _.groupBy(positionStats, 'position');

  let groupedStats = [];
  Object.keys(groupedByPosition).forEach(function (position) {
    groupedStats.push({
      position,
      places: groupedByPosition[position].map(item => item.constituency_name)
    });
  });

  partyPosition.push({
    party_name: partyName,
    stats: groupedStats
  })
}

fs.writeFile('./docs/data/party_data.json', JSON.stringify({
  parties: Array.from(parties),
  stats: partyPosition
}), (err) => {
  if (err) {
    console.log(err);
    process.exit(0);
  }
  console.log("Successfully Written party stats to party_data.json");
});

