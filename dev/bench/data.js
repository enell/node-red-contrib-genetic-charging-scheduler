window.BENCHMARK_DATA = {
  "lastUpdate": 1672737816243,
  "repoUrl": "https://github.com/enell/node-red-contrib-genetic-charging-scheduler",
  "entries": {
    "Calculate": [
      {
        "commit": {
          "author": {
            "email": "johan.enell@qlik.com",
            "name": "Johan Enell",
            "username": "enell"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "245d8d06c7276f0cf97bc322aa1a83d201817788",
          "message": "feat: New fitness",
          "timestamp": "2022-12-30T09:30:47+01:00",
          "tree_id": "c892ffc520ece3342923f2c95cd034202a8d97ba",
          "url": "https://github.com/enell/node-red-contrib-genetic-charging-scheduler/commit/245d8d06c7276f0cf97bc322aa1a83d201817788"
        },
        "date": 1672389085713,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "calculate schedule",
            "value": 3.2,
            "range": "±2.42%",
            "unit": "ops/sec",
            "extra": "13 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "johan.enell@qlik.com",
            "name": "Johan Enell",
            "username": "enell"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "5e7d04037df2f6bbeb24226b4d9a041ed60c1fbd",
          "message": "Merge pull request #9 from enell/alpha\n\nfeat: read initial battery soc from payload",
          "timestamp": "2023-01-03T10:22:56+01:00",
          "tree_id": "d32eb05c2a6c79c0335520eca7e22222e982cb99",
          "url": "https://github.com/enell/node-red-contrib-genetic-charging-scheduler/commit/5e7d04037df2f6bbeb24226b4d9a041ed60c1fbd"
        },
        "date": 1672737814307,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "calculate schedule",
            "value": 3.21,
            "range": "±1.72%",
            "unit": "ops/sec",
            "extra": "13 samples"
          }
        ]
      }
    ]
  }
}