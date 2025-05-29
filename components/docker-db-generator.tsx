"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";

interface DockerDBConfig {
  mongoUsername: string;
  mongoPassword: string;
  redisPassword: string;
}

export default function DockerDBGenerator() {
  const [config, setConfig] = useState<DockerDBConfig>({
    mongoUsername: 'erxes',
    mongoPassword: 'your_mongo_password',
    redisPassword: 'your_redis_password'
  });

  const [generatedYaml, setGeneratedYaml] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedYaml);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleInputChange = (field: keyof DockerDBConfig) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfig({
      ...config,
      [field]: event.target.value
    });
  };

  const generateDockerCompose = () => {
    const dockerCompose = `version: "3.3"
networks:
  erxes:
    external: true
services:
  mongo:
    hostname: mongo
    image: mongo:4.4.25
    ports:
      - 0.0.0.0:27017:27017
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${config.mongoUsername}
      MONGO_INITDB_ROOT_PASSWORD: ${config.mongoPassword}
    networks:
      - erxes
    volumes:
      - ./mongodata:/data/db
      - ./mongo-key:/etc/mongodb/keys/mongo-key
    command:
      - --replSet
      - rs0
      - --bind_ip_all
      - --keyFile
      - /etc/mongodb/keys/mongo-key
    extra_hosts:
      - "mongo:"
      - "mongo-secondary:"
  redis:
    image: redis:7.2.1
    command: redis-server --appendonly yes --requirepass ${config.redisPassword}
    ports:
      - 6379:6379
    networks:
      - erxes
    volumes:
      - ./redisdata:/data`;

    setGeneratedYaml(dockerCompose);
  };

  return (
    <div className="p-6">
      <Card>

        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mongoUsername">MongoDB Username</Label>
              <Input
                id="mongoUsername"
                value={config.mongoUsername}
                onChange={handleInputChange('mongoUsername')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mongoPassword">MongoDB Password</Label>
              <Input
                id="mongoPassword"
                // type="password"
                value={config.mongoPassword}
                onChange={handleInputChange('mongoPassword')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="redisPassword">Redis Password</Label>
              <Input
                id="redisPassword"
                // type="password"
                value={config.redisPassword}
                onChange={handleInputChange('redisPassword')}
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
            <CardTitle>Generated docker-compose-dbs.yml file</CardTitle>
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