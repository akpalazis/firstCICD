pipeline {
  agent any
  environment {
    JENKINS = 'true'
  }

  tools {
    nodejs "npm"
    dockerTool "docker"
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
          sh 'docker build -f Dockerfile.index -t my_node:latest .'
          sh 'docker build -f Dockerfile.tokens -t my_node2:latest .'
          sh 'docker run -d -p 3000:3000 --name my-node my_node:latest'
          sh 'docker run -d -p 3001:3001 --name my-node2 my_node2:latest'
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
    stage('Developer Docker Stop v1') {
      when {
        expression { env.BRANCH_NAME == 'developer' } // Only run this stage for the developer branch
      }
      steps {
        // Add your deployment steps for the developer branch here
        script {
          sh 'docker stop my-node'
          sh 'docker stop my-node2'
          sh 'docker rm my-node'
          sh 'docker rm my-node2'
          sh 'docker rmi my_node:latest'
          sh 'docker rmi my_node2:latest'
        }
      }
    }
  }
}
