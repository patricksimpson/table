require 'mina/git'

set :domain, '192.241.172.114'
set :deploy_to, '/var/www/thetable.io'
set :repository, 'git@github.com:patricksimpson/table'
set :branch, 'master'
set :user, 'patrick'
set :forward_agent, true

set :shared_paths, ['node_modules', 'bower_components']

task :environment do
  queue %{
    echo "-----> Loading environment"
    #{echo_cmd %[source ~/.bash_profile]}
  }
end

task :setup => :environment do
  settings.shared_paths.each do |path|
    queue! %[mkdir -p "#{deploy_to}/shared/#{path}"]
    queue! %[chmod g+rx,u+rwx "#{deploy_to}/shared/#{path}"]
  end
end

def yes_or_exit(message)
  print "#{message} (yN) "
  answer = STDIN::gets.strip.downcase
  if answer != 'y'
    puts 'Aborting.'
    Process.exit
  end
end

def unpushed_commits
  `git log --oneline origin/master..HEAD | wc -l`.to_i
end

def uncommitted_changes
  `git diff --shortstat | wc -l`.to_i != 0
end

def check_for_unpushed_changes
  count = unpushed_commits
  if count > 0
    pluralized = count == 1 ? 'commit' : 'commits'
    yes_or_exit "#{count} unpushed #{pluralized}, continue?"
  end
end

def check_for_uncommited_changes
  yes_or_exit 'Uncommitted changes, continue?' if uncommitted_changes
end

desc "Deploys the latest commit from your git remote to the server."
task :deploy => :environment do
  check_for_unpushed_changes
  check_for_uncommited_changes

  deploy do
    invoke :'git:clone'
    invoke :'deploy:link_shared_paths'
  
    queue 'echo "-----> nstalling npm packages"'
    queue 'npm install'
    queue 'echo "-----> Installing bundle components"'
    queue 'echo "-----> Installing bower components"'
    # queue 'bower install'
    queue 'echo "-----> Building with Tapas and Brunch"'
    queue 'cake build'
    # queue 'BRUNCH_ENV=production ./node_modules/.bin/brunch b -P'
    # queue 'echo "-----> Deleting files not need for deploy"'
    # queue 'ls -1 | grep -v public | xargs rm -rf'
    queue 'echo "-----> Cleaning up the old crap"'
    invoke :'deploy:cleanup'
  end
end

desc "Rolls back the latest release"
task :rollback => :environment do
  queue! %[echo "-----> Rolling back to previous release for instance: #{domain}"]

  # Delete existing sym link and create a new symlink pointing to the previous release
  # queue %[echo -n "-----> Creating new symlink from the previous release: "]
  # queue %[ls "#{deploy_to}/releases" -Art | sort | tail -n 2 | head -n 1]
  queue! %[ls -Art "#{deploy_to}/releases" | sort | tail -n 2 | head -n 1 | xargs -I active ln -nfs "#{deploy_to}/releases/active" "#{deploy_to}/current"]

  # Remove latest release folder (active release)
  queue %[echo -n "-----> Deleting active release: "]
  queue %[ls "#{deploy_to}/releases" -Art | sort | tail -n 1]
  queue! %[ls "#{deploy_to}/releases" -Art | sort | tail -n 1 | xargs -I active rm -rf "#{deploy_to}/releases/active"]
end
