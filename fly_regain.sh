#!/usr/bin/env perl

my $vars=`/root/.fly/bin/flyctl secrets list | grep -v DIGEST  | awk '{ print \$1 }'`;
my $output=`/root/.fly/bin/flyctl ssh console -C 'env' 2>/dev/null`;

my %lookup = map { $_ => 1 } split /\n/, $vars;


for (split /\n/, $output) {
  my ($varname) = split /=/;

  if ($lookup{$varname}) {
    print "$_\n";
  }
}