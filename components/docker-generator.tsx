"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";

interface DockerConfig {
  domain: string;
  mongoUrl: string;
  redisPassword: string;
  jwtSecret: string;
  replicas: number;
}

export default function DockerGenerator() {
  const [config, setConfig] = useState<DockerConfig>({
    domain: 'yourdomain.com',
    mongoUrl: 'mongodb://yourusername:yourpassword@yourmongodbhost:yourmongodbport/yourdatabase',
    redisPassword: 'yourredispassword',
    jwtSecret: 'yourjwtsecret',
    replicas: 1
  });

  const [generatedYaml, setGeneratedYaml] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  const generateDockerCompose = () => {
    const dockerCompose = `version: '3.7'
networks:
  erxes:
    external: true
services:
  coreui:
    image: erxes/erxes-next-ui:latest
    environment:
      REACT_APP_PUBLIC_PATH: ''
      REACT_APP_CDN_HOST: https://${config.domain}/widgets
      REACT_APP_API_URL: https://${config.domain}/gateway
      REACT_APP_DASHBOARD_URL: https://${config.domain}/dashboard/api
      REACT_APP_API_SUBSCRIPTION_URL: wss://${config.domain}/gateway/graphql
      NGINX_PORT: 80
      NGINX_HOST: ${config.domain}
      NODE_ENV: production
      REACT_APP_FILE_UPLOAD_MAX_SIZE: 524288000
      REACT_APP_RELEASE: master
    ports:
      - 3000:80
    networks:
      - erxes
    deploy: &a1
      mode: replicated
      replicas: ${config.replicas}
      update_config:
        order: start-first
        failure_action: rollback
        delay: 1s
  plugin-core-api:
    image: erxes/erxes-next-core-api:latest
    environment:
      OTEL_SERVICE_NAME: plugin-core-api
      SERVICE_NAME: core-api
      PORT: 80
      JWT_TOKEN_SECRET: ${config.jwtSecret}
      LOAD_BALANCER_ADDRESS: http://plugin-core-api
      MONGO_URL: ${config.mongoUrl}
      NODE_INSPECTOR: null
      EMAIL_VERIFIER_ENDPOINT: https://email-verifier.erxes.io
      ELASTIC_APM_HOST_NAME: null
      DEBUG: '*error*'
      NODE_ENV: production
      DOMAIN: https://${config.domain}
      REDIS_HOST: erxes-dbs_redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${config.redisPassword}
      ELASTICSEARCH_URL: http://erxes-dbs_elasticsearch:9200
      RELEASE: master
      VERSION: os
      MESSAGE_BROKER_PREFIX: ''
    extra_hosts: &a2 []
    volumes:
      - ./permissions.json:/erxes/packages/core/permissions.json

    networks:
      - erxes
    deploy: *a1
  plugin-accounting-api:
    image: erxes/erxes-next-accounting_api:latest
    environment:
      OTEL_SERVICE_NAME: accounting
      SERVICE_NAME: accounting
      PORT: 80
      JWT_TOKEN_SECRET: ${config.jwtSecret}
      LOAD_BALANCER_ADDRESS: http://plugin-accounting-api
      MONGO_URL: ${config.mongoUrl}
      NODE_INSPECTOR: null
      ELASTIC_APM_HOST_NAME: null
      DEBUG: '*error*'
      NODE_ENV: production
      DOMAIN: https://${config.domain}
      REDIS_HOST: erxes-dbs_redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${config.redisPassword}
      VERSION: os
    extra_hosts: *a2
    networks:
      - erxes
    deploy: *a1
  plugin-frontline-api:
    image: erxes/erxes-next-frontline_api:latest
    environment:
      OTEL_SERVICE_NAME: frontline
      SERVICE_NAME: frontline
      PORT: 80
      CLIENT_PORTAL_DOMAINS: http://localhost:8080,http://localhost:7002,http://192.168.43.156:7002/
      JWT_TOKEN_SECRET: ${config.jwtSecret}
      LOAD_BALANCER_ADDRESS: http://plugin-frontline-api
      MONGO_URL: ${config.mongoUrl}
      NODE_INSPECTOR: null
      ELASTIC_APM_HOST_NAME: null
      DEBUG: '*error*'
      NODE_ENV: production
      DOMAIN: https://${config.domain}
      WIDGETS_DOMAIN: https://${config.domain}/widgets
      REDIS_HOST: erxes-dbs_redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${config.redisPassword}
      VERSION: os
    extra_hosts: *a2
    networks:
      - erxes
    deploy: *a1
  gateway:
    image: erxes/erxes-next-gateway:latest
    environment:
      OTEL_SERVICE_NAME: gateway
      SERVICE_NAME: gateway
      PORT: 80
      LOAD_BALANCER_ADDRESS: http://gateway
      JWT_TOKEN_SECRET: ${config.jwtSecret}
      MONGO_URL: ${config.mongoUrl}
      NODE_INSPECTOR: null
      ELASTIC_APM_HOST_NAME: null
      DEBUG: '*error*'
      NODE_ENV: production
      DOMAIN: https://${config.domain}
      REDIS_HOST: erxes-dbs_redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${config.redisPassword}
      VERSION: os
      INTROSPECTION: 'true'
      ENABLED_PLUGINS: 'frontline,accounting'
    healthcheck:
      test:
        - CMD
        - curl
        - -i
        - http://localhost:80/health
      interval: 30s
      start_period: 30s
    extra_hosts: *a2
    ports:
      - 3300:80
    networks:
      - erxes
    deploy: *a1`;

    setGeneratedYaml(dockerCompose);
  };

  const handleInputChange = (field: keyof DockerConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfig({
      ...config,
      [field]: event.target.value
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedYaml);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Docker Compose Generator</h1>
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={config.domain}
                onChange={handleInputChange('domain')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mongoUrl">MongoDB URL</Label>
              <Input
                id="mongoUrl"
                value={config.mongoUrl}
                onChange={handleInputChange('mongoUrl')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="redisPassword">Redis Password</Label>
              <Input
                id="redisPassword"
                value={config.redisPassword}
                onChange={handleInputChange('redisPassword')}
              />
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="jwtSecret">JWT Secret</Label>
              <Input
                id="jwtSecret"
                value={config.jwtSecret}
                onChange={handleInputChange('jwtSecret')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replicas">Number of Replicas</Label>
              <Input
                id="replicas"
                type="number"
                value={config.replicas}
                onChange={handleInputChange('replicas')}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6">
        <Button onClick={generateDockerCompose}>Generate Docker Compose</Button>
      </div>
      {generatedYaml && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Generated Docker Compose</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              {copySuccess ? 'Copied!' : 'Copy'}
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{generatedYaml}</code>
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}