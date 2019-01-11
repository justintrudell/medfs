# Deployment

This doc outlines how to set up a deployment pipeline and then deploy to it. You'll only need to run the configuration steps once, then you can skip straight to deploy

## Configuration

1. Before anything, make sure you have medfs credentials in `~/.aws/credentials`. I have them under a `[medfs]` tag so that I can still use my regular aws account and just append `--profile medfs` when making medfs-related calls.

   ```
   # Example file
   [default]
   aws_access_key_id = ...
   aws_secret_access_key = ...
   region = us-east-1

   [medfs]
   aws_access_key_id = ...
   aws_secret_access_key = ...
   region = us-east-1
   ```

2. Download the latest version of ecs-cli: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_CLI_installation.html
3. We'll need to configure the ecs-cli to pick up our cluster:
   ```
   ecs-cli configure profile --profile-name medfs --access-key $AWS_ACCESS_KEY --secret-key $AWS_SECRET_KEY
   ecs-cli configure --cluster medfs --region us-east-1 --default-launch-type FARGATE
   ```

## Deployment

Once you've finished the configuration section, you don't need to run it again. You should be able to deploy with these steps

```
# Assuming in top level directory of medfs

# Pushes images to medfs
make push

# Deploys pushed images
make deploy
```

Push and deploy are separate commands as it's often the case you might want to just redeploy to debug failure cases/setting tweaks.
