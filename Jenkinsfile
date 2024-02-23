pipeline {
    agent any

    triggers {
        // Trigger build on push to main branch
        githubPush(branchFilter: 'main')
        // Trigger build on push to developer branch
        githubPush(branchFilter: 'developer')
    }

    environment {
        // Define environment variables if needed
        // For example:
        // MY_VARIABLE = 'some_value'
    }

    stages {
        // Build stage for main branch
        stage('Main Build') {
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                script {
                    sh 'npm install' // Install dependencies
                    sh 'npm test' // Run unit tests
                    sh 'npm run build-prod' // Build for production
                }
            }
        }

        // Build stage for developer branch
        stage('Developer Build') {
            when {
                expression { env.BRANCH_NAME == 'developer' }
            }
            steps {
                script {
                    sh 'npm install' // Install dependencies
                    sh 'npm test' // Run unit tests
                    sh 'npm run build-dev' // Build for development
                }
            }
        }

        // Run stage for developer branch
        stage('Developer Run') {
            when {
                expression { env.BRANCH_NAME == 'developer' }
            }
            steps {
                script {
                    sh 'npm run start-dev' // Start the API for development
                }
            }
        }

        // Run stage for main branch
        stage('Production Run') {
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                script {
                    sh 'npm run start-prod' // Start the API for production
                }
            }
        }
    }
}
