@Library('Shared') _
pipeline {
    agent {
        label 'LocalWindows'
    }

    environment {
        IMAGE_NAME = 'bhavin42/ai-demo'
        IMAGE_TAG = "${BUILD_NUMBER}"
        SONAR_HOME = tool 'SonarQubeScanner'
        DOCKER_BUILDKIT = 1
        EMAIL_FROM = 'bhavindami@gmail.com'
        EMAIL_TO = 'jethava.bhavin@gmail.com'
    }

    stages {

        // ============================================================
        // 1. CHECKOUT
        // ============================================================
        stage('Checkout Code') {
            steps {
                checkoutCode(
                    url: 'https://github.com/jethavabhavin/ai-demo',
                    branch: 'main'
                )
            }
        }

        // ============================================================
        // 2. GENERATE ENV FILES
        // ============================================================
        stage('Generate Environment Files') {
            steps {
                generateEnvFiles(
                    serverCredentialsId: 'ServerEnv',
                    pwaCredentialsId: 'PwaEnv'
                )
            }
        }

        // ============================================================
        // 3. CHECK ENVIRONMENT
        // ============================================================
        stage('Check Environment') {
            steps {
                checkEnvironment()
            }
        }

        // ============================================================
        // 4. INSTALL DEPENDENCIES / TEST
        // ============================================================
        stage('Testing') {
            steps {
                runTests()
            }
        }

        // ============================================================
        // 5. SONARQUBE ANALYSIS
        // ============================================================
        stage('SonarQube Analysis') {
            steps {
                script {
                    sonarAnalysis(
                        serverName: 'SonarQubeServer',
                        projectKey: 'ai-demo',
                        projectName: 'ai-demo'
                    )
                }
            }
        }

        // ============================================================
        // 6. SONAR QUALITY GATE
        // ============================================================
        stage('Quality Gate') {
            steps {
                script {
                    sonarQualityGate(
                        timeoutMinutes: 2,
                        abortPipeline: true
                    )
                }
            }
        }

        // ============================================================
        // 7. BUILD DOCKER IMAGE
        // ============================================================
        stage('Build Docker Image') {
            steps {
                buildDockerImage(
                    imageName: env.IMAGE_NAME,
                    imageTag: env.IMAGE_TAG
                )
            }
        }

        // ============================================================
        // 8. TRIVY SECURITY SCAN
        // ============================================================
        stage('Trivy Security Scan') {
            steps {
                script {
                    echo "trivyScan"
                    trivyScan(
                        imageName: env.IMAGE_NAME,
                        imageTag: env.IMAGE_TAG,
                        severity: 'HIGH,CRITICAL',
                        exitCode: 1
                    )
                }
            }
        }

        // ============================================================
        // 9. OWASP DEPENDENCY CHECK
        // ============================================================
        stage('OWASP Dependency Check') {
            steps {
                script {
                    echo "owaspScan"
                    // owaspScan(
                    //     scanPath: './',
                    //     odcInstallation: 'OWASP'
                    // )
                }
            }
        }

        // ============================================================
        // 10. PUSH IMAGE
        // ============================================================
        stage('Push Image to Docker Hub') {
            steps {
                pushDockerImage(
                    credentialsId: 'DockerHub',
                    imageName: env.IMAGE_NAME,
                    imageTag: env.IMAGE_TAG
                )
            }
        }

        // ============================================================
        // 11. DEPLOY
        // ============================================================
        stage('Deploy') {
            steps {
                deployApp()
            }
        }
    }

    // ================================================================
    // POST ACTIONS
    // ================================================================
    post {
        success {
            notifySuccess()
        }

        failure {
            notifyFailure()
        }

        always {
            cleanWorkspace()
        }
    }
}