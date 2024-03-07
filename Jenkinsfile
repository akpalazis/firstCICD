pipeline {
  agent any
  environment {
        AUTH_SECRET_KEY = credentials('access-token')
        REFRESH_SECRET_KEY = credentials('refresh-token')
        DB_URL = credentials('db-url')

    }
  tools {
    nodejs "npm"
  }
  stages {


    // Stage for Build to development environment
    stage('Developer Build NodeFile') {
      when {
        expression { env.BRANCH_NAME == 'developer' } // Only run this stage for the developer branch
      }
      steps {
        // Add your deployment steps for the developer branch here
        script {
          sh 'npm install'
          sh 'npm run build-dev'
        }
      }
    }
    stage('Developer Docker Start') {
      when {
        expression { env.BRANCH_NAME == 'developer' } // Only run this stage for the developer branch
      }
      steps {
        // Add your deployment steps for the developer branch here
        script {
          sh '/usr/local/bin/docker-compose up --build'
        }
      }
    }
    // Stage for test on the developer branch
    stage('Developer Test v1') {
      when {
        expression { env.BRANCH_NAME == 'developer' } // Only run this stage for the developer branch
      }
      steps {
        script {
          sh 'npm run test'
        }
      }
    }
  }
    post {
        always {
            script {
                // Cleanup Docker image if the environment is set to "developer"
                if (env.BRANCH_NAME == 'developer') {
                    sh 'docker stop my-node || true'
                    sh 'docker rm my-node || true'
                    sh 'docker rmi my_node:latest || true'
                }
            }
        }
    }
}
