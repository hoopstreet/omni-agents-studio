# Knowledge Base Manager Skill

## Description

This skill provides comprehensive tools for managing the 4-Layer Knowledge Architecture within Omni-Agents Studio: Global, Project, Agent, and Personal Knowledge. It enables users to upload, organize, search, and retrieve information from various document types, supporting RAG, embeddings, and semantic search capabilities.

## Capabilities

- **Document Management:** Upload, store, and categorize various file types (PDF, DOCX, TXT, CSV, XLSX, Markdown, Images, Audio, Video, GitHub Repositories, Web Pages, Google Drive, Notion).
- **Knowledge Organization:** Assign documents to specific knowledge layers (Global, Project, Agent, Personal) and tag them for easy retrieval.
- **Semantic Search & Retrieval:** Utilize embeddings and semantic search to find relevant information across the knowledge base, supporting Retrieval Augmented Generation (RAG).
- **Memory Retrieval:** Facilitate memory retrieval for agents, allowing them to access and leverage stored knowledge during task execution.
- **Summarization & Extraction:** Generate summaries and extract key information from documents.
- **Version Control:** Track document versions and changes over time.

## Usage

Users interact with this skill through the Library and Knowledge sections of Omni-Agents Studio. They can:

- Upload new documents and associate them with projects or agents.
- Search for information across all knowledge layers using natural language queries.
- View document summaries and extracted insights.
- Organize documents with tags and categories.
- Integrate knowledge into agent workflows for enhanced performance.

### Configuration

Knowledge documents are stored in the `knowledgeDocs` table, with metadata such as `fileType`, `fileKey` (for S3 storage), `fileUrl`, `summary`, and `tags`. Relationships to projects and users are maintained.

### API Endpoints (tRPC Procedures)

- `knowledge.uploadDocument`: Uploads a new document to the knowledge base.
- `knowledge.getDocument`: Retrieves a document by ID.
- `knowledge.search`: Performs a semantic search across the knowledge base.
- `knowledge.updateDocument`: Updates document metadata or content.
- `knowledge.deleteDocument`: Deletes a document.
- `knowledge.tagDocument`: Adds tags to a document.
- `knowledge.summarizeDocument`: Generates a summary for a document.

## Integration with Omni-Agents Studio

This skill is central to the Omni-Agents Studio's ability to manage and leverage information. It integrates with the Library for document storage, the Agent System for RAG and memory, and the Project System for contextual knowledge. It relies on the built-in storage helpers for file management and potentially on LLM integration for summarization and semantic processing.
