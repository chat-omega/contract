# Agentic GraphRAG on commercial contracts

This repository processes the Contract Understanding Atticus Dataset (CUAD) using LangChain to extract structured data from legal contracts and build a comprehensive knowledge graph.
The system includes a LangGraph-powered agent for intelligent querying and analysis of contract information.

See blog for more: https://towardsdatascience.com/agentic-graphrag-for-commercial-contracts/

![](https://cdn-images-1.medium.com/max/800/1*R57-KUW9zvXhx5VucKEMLA.png)

## 📄 About CUAD

The [Contract Understanding Atticus Dataset (CUAD)](https://www.atticusprojectai.org/cuad) consists of 500 contracts with annotations for 41 legal clauses. This dataset provides a rich source of legal text for information extraction and analysis.

## 🚀 Features

- **Contract Processing**: Extract structured data from 500 CUAD contracts using LangChain
- **Knowledge Graph Construction**: Build a comprehensive graph database of contract relationships and clauses
- **Intelligent Query System**: Utilize LangGraph agents to query and analyze the contract database

## 🛠️ Setup and Installation

1. Clone the repository
2. Copy the environment file:
   ```
   copy .env.example to .env
   ```
3. Start the application:
   ```
   docker-compose up
   ```
