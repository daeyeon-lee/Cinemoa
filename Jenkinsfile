pipeline {
  agent any
  options {
    timeout(time: 1, unit: 'HOURS')
  }
  environment {
    DOCKER_IMAGE_BE = "941kjw/cinemoa"
    DOCKER_IMAGE_FE = "941kjw/cinemoafe"
    EC2_HOST = 'i13a110.p.ssafy.io'
    DOCKER_TAG = "latest"
  }

  stages {
    stage('Build BE') {
      when {
        allOf {
          branch 'main'
          changeset 'backend/**'
        }
        beforeAgent true
      }
      steps {
        echo 'backend/** 변경 감지: 백엔드 Docker 빌드를 시작합니다.'
        script {
          withCredentials([
            file(credentialsId: 'application', variable: 'APPLICATION'),
            file(credentialsId: 'application-db', variable: 'APPLICATION_DB'),
            file(credentialsId: 'application-security', variable: 'APPLICATION_SECURITY'),
            file(credentialsId: 'application-db-local', variable: 'APPLICATION_DB_LOCAL'),
            file(credentialsId: 'application-api', variable: 'APPLICATION_API'),
            file(credentialsId: 'application-mail', variable: 'APPLICATION_MAIL'),
            file(credentialsId: 'ssl-key-p12', variable: 'SSL_KEY_FILE')
          ]) {
            sh '''
              cd ./backend
              mkdir -p ./src/main/resources
              cp $APPLICATION ./src/main/resources/application.yml
              cp $APPLICATION_DB ./src/main/resources/application-db.yml
              cp $APPLICATION_DB_LOCAL ./src/main/resources/application-db-local.yml
              cp $APPLICATION_SECURITY ./src/main/resources/application-security.yml
              cp $APPLICATION_API ./src/main/resources/application-api.yml
              cp $APPLICATION_MAIL ./src/main/resources/application-mail.yml
              cp $SSL_KEY_FILE ./src/main/resources/keystore.p12
              chmod +x ./gradlew
              docker build -t ${DOCKER_IMAGE_BE}:${DOCKER_TAG} .
            '''
          }
        }
      }
      post {
        failure {
          echo 'BE 빌드 스테이지 실패: Docker 빌드 또는 푸시에 문제가 발생했습니다.'
          sh 'echo "Error details: $BUILD_LOG"'
        }
      }
    }

    stage('Deploy BE with Compose') {
      when {
        allOf {
          branch 'main'
          changeset 'backend/**'
        }
        beforeAgent true
      }
      steps {
        script {
          sh 'docker compose -f /var/scripts/backend.yml up -d'
        }
      }
      post {
        failure {
          echo 'BE 배포 스테이지 실패: Compose 실행에 문제가 발생했습니다.'
        }
      }
    }

    stage('Build FE') {
      when {
        allOf {
          branch 'main'
          changeset 'frontend/**'
        }
        beforeAgent true
      }
      steps {
        echo 'frontend/** 변경 감지: 프론트엔드 Docker 빌드를 시작합니다.'
        script {
          withCredentials([
            file(credentialsId: 'ssl-private-key', variable: 'SSL_PRIVATE_KEY'),
            file(credentialsId: 'ssl-full-chain', variable: 'SSL_FULL_CHAIN'),
            file(credentialsId: 'env', variable: 'ENV'),
            file(credentialsId: 'ssl-key-p12', variable: 'SSL_KEY_FILE')
          ]) {
            sh '''
              cd ./frontend
              mkdir -p ./ssl
              cp $ENV ./.env
              cp $SSL_PRIVATE_KEY ./ssl/privkey.pem
              cp $SSL_FULL_CHAIN ./ssl/fullchain.pem
              chmod 600 ./ssl/*.pem
              docker build -t ${DOCKER_IMAGE_FE}:${DOCKER_TAG} .
            '''
          }
        }
      }
      post {
        failure {
          echo 'FE 빌드 스테이지 실패: Docker 빌드 또는 푸시에 문제가 발생했습니다.'
          sh 'echo "Error details: $BUILD_LOG"'
        }
      }
    }

    stage('Deploy FE with Compose') {
      when {
        allOf {
          branch 'main'
          changeset 'frontend/**'
        }
        beforeAgent true
      }
      steps {
        script {
          sh 'docker compose -f /var/scripts/frontend.yml up -d'
        }
      }
      post {
        failure {
          echo 'FE 배포 스테이지 실패: Compose 실행에 문제가 발생했습니다.'
        }
      }
    }

    stage('No relevant changes on main') {
      when {
        allOf {
          branch 'main'
          not {
            anyOf {
              changeset 'frontend/**'
              changeset 'backend/**'
            }
          }
        }
        beforeAgent true
      }
      steps {
        echo 'frontend/** 또는 backend/** 변경이 없어 모든 빌드/배포 단계를 건너뜁니다.'
      }
    }
  }

  post {
    always {
      echo "${env.BRANCH_NAME} 브랜치 대상 파이프라인 실행 완료."
    }
    failure {
      echo "전체 파이프라인 실패: 빌드 번호 ${BUILD_NUMBER}에서 오류 발생."
    }
    success {
      echo '파이프라인 성공: 모든 단계가 정상적으로 완료되었습니다.'
    }
  }
}