# Nodewave

## Overview

Nodewave is a data analytics platform, equipped to help you analyze data throughout the entire data analysis process. Nodewave is capable of doing everything from exploratory data analysis to monitoring management metrics. 

## Project Description

This project was made as a part of Prof. Anand Gupta's Senior Design (CS 4485) section by UTD students. 

## Installation

To get started with this project, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/greeshiee/CS4485-T7.git
   ```
2. Install Docker on your system if you haven't already. You can download it from the official Docker website.
  a. Ensure your system meets the requirements:
      - For Windows: 64-bit Windows 10 Pro or higher
      - For macOS: macOS 10.14 or newer
      - For Linux: A supported Linux distribution (e.g., Ubuntu, Debian, CentOS)

   b. Download Docker Desktop from the official Docker website (https://www.docker.com/products/docker-desktop).

   c. Run the installer:
      - On Windows: Double-click the Docker Desktop Installer.exe
      - On macOS: Drag the Docker icon to the Applications folder

   d. Follow the installation wizard:
      - On Windows, ensure "Use WSL 2 instead of Hyper-V" is selected if available
      - Accept the license agreement

   e. After installation, start Docker Desktop:
      - On Windows and macOS: Open Docker Desktop from the Start menu or Applications folder
      - On Linux: Start the Docker service with `sudo service docker start`

   f. Verify the installation by running:
      ```bash
      docker --version
      docker run hello-world
      ```

## Usage

3. Set up and run the Mage data pipeline:
   ```bash
   cd mage-t4
   docker compose up
   ```

4. Start the backend:
   - On Windows:
     ```
     cd api
     start_api.bat
     ```
   - On macOS/Linux:
     ```
     cd api
     ./start_api.sh
     ```

5. Run the frontend:
   ```bash
   npm start
   ```

Note each of these must be run on a separate terminal, all these processs are mean to be executed concurrently. 

## Features

Nodewave offers a comprehensive suite of data analytics tools and functionalities:

- **Data Pipelining**: Efficiently manage and automate your data workflows.
- **Fault Management**: Monitor and handle system faults through a dedicated interface.
- **Data Ingestion**: Seamlessly import data from various sources into the platform.
- **Performance Management**: Track and analyze system performance metrics.
- **Authentication**: Secure user authentication system to protect sensitive data.
- **KPI Formula Management**: Define and manage Key Performance Indicators for your data.

Each of these components contributes to making Nodewave a powerful and versatile data analytics platform, capable of handling complex data processing tasks and providing valuable insights.
