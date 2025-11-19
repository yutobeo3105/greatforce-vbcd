"use client";

import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, Building2, TrendingUp, DollarSign, CheckCircle, Clock, ArrowRight, Calendar } from "lucide-react";
import { AppLayout } from "~/components/app-layout";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useIsMobile } from "~/hooks/use-mobile";

const STAGE_COLORS = {
  "Lead": "#8b5cf6",
  "Qualified": "#3b82f6",
  "Proposal": "#06b6d4",
  "Negotiation": "#10b981",
  "Closed Won": "#22c55e",
  "Closed Lost": "#ef4444",
};

function MobileDashboard() {
  const { data: contactStats } = api.contact.getStats.useQuery();
  const { data: companyStats } = api.company.getStats.useQuery();
  const { data: dealStats } = api.deal.getStats.useQuery();
  const { data: activityStats } = api.activity.getStats.useQuery();
  const { data: upcomingActivities } = api.activity.getUpcoming.useQuery();
  const { data: overdueActivities } = api.activity.getOverdue.useQuery();
  const { data: deals } = api.deal.getAll.useQuery();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your sales overview</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/contacts">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-primary" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{contactStats?.total ?? 0}</div>
              <div className="text-xs text-muted-foreground">Contacts</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/companies">
          <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{companyStats?.total ?? 0}</div>
              <div className="text-xs text-muted-foreground">Companies</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/deals">
          <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{dealStats?.total ?? 0}</div>
              <div className="text-xs text-muted-foreground">Active Deals</div>
            </CardContent>
          </Card>
        </Link>

        <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-xl font-bold">{formatCurrency(dealStats?.totalValue ?? 0)}</div>
            <div className="text-xs text-muted-foreground">Pipeline Value</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Upcoming Activities</CardTitle>
            <Link href="/activities">
              <Button variant="ghost" size="sm" className="h-8">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {overdueActivities && overdueActivities.length > 0 && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 text-destructive">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {overdueActivities.length} overdue tasks
                </span>
              </div>
            </div>
          )}
          
          {upcomingActivities?.slice(0, 3).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className={`h-2 w-2 rounded-full mt-2 ${activity.completed ? 'bg-green-500' : 'bg-primary'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  {activity.dueDate
                    ? new Date(activity.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                      })
                    : "No date"}
                </div>
              </div>
            </div>
          ))}
          
          {(!upcomingActivities || upcomingActivities.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No upcoming activities</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Top Deals</CardTitle>
            <Link href="/deals">
              <Button variant="ghost" size="sm" className="h-8">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {deals?.slice(0, 4).map((deal) => (
            <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{deal.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {deal.company?.name ?? deal.contact?.firstName + " " + deal.contact?.lastName}
                </p>
              </div>
              <div className="text-right ml-3">
                <p className="font-bold text-sm">{formatCurrency(deal.value)}</p>
                <span 
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium inline-block"
                  style={{ 
                    backgroundColor: STAGE_COLORS[deal.stage as keyof typeof STAGE_COLORS] + '20',
                    color: STAGE_COLORS[deal.stage as keyof typeof STAGE_COLORS]
                  }}
                >
                  {deal.stage}
                </span>
              </div>
            </div>
          ))}
          
          {(!deals || deals.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No deals yet</p>
              <Link href="/deals">
                <Button className="mt-4" size="sm">Create your first deal</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DesktopDashboard() {
  const { data: contactStats } = api.contact.getStats.useQuery();
  const { data: companyStats } = api.company.getStats.useQuery();
  const { data: dealStats } = api.deal.getStats.useQuery();
  const { data: activityStats } = api.activity.getStats.useQuery();
  const { data: upcomingActivities } = api.activity.getUpcoming.useQuery();
  const { data: overdueActivities } = api.activity.getOverdue.useQuery();
  const { data: recentContacts } = api.contact.getAll.useQuery();
  const { data: deals } = api.deal.getAll.useQuery();
  const { data: dealsByStage } = api.deal.getByStage.useQuery();
  const { data: monthlyGrowth } = api.deal.getMonthlyGrowth.useQuery();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const stageData = dealsByStage?.map(stage => ({
    name: stage.stage,
    value: stage.deals.length,
    amount: stage.deals.reduce((sum, deal) => sum + deal.value, 0),
  })) ?? [];

  const revenueData = dealsByStage?.map((stage, index) => ({
    stage: stage.stage,
    deals: stage.deals.length,
    value: stage.deals.reduce((sum, deal) => sum + deal.value, 0) / 1000,
  })) ?? [];

  const activityCompletionRate = activityStats?.completionRate ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here&apos;s your sales performance overview.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="hover:shadow-lg hover:shadow-primary/10 transition-all border-muted/40 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Contacts</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/contacts">
              <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">{contactStats?.total ?? 0}</div>
              <div className="flex items-center gap-1 mt-2">
                <p className="text-xs text-green-500">+{contactStats?.recentCount ?? 0} this month</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:shadow-primary/10 transition-all border-muted/40 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Companies</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/companies">
              <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">{companyStats?.total ?? 0}</div>
              <div className="flex items-center gap-1 mt-2">
                <p className="text-xs text-green-500">{companyStats?.total ?? 0} active</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:shadow-primary/10 transition-all border-muted/40 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Deals</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/deals">
              <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">{dealStats?.total ?? 0}</div>
              <div className="flex items-center gap-1 mt-2">
                <p className="text-xs text-green-500">{dealsByStage?.find(s => s.stage === 'Closed Won')?.deals.length ?? 0} won</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg hover:shadow-primary/10 transition-all border-muted/40 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline Value</CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">{formatCurrency(dealStats?.totalValue ?? 0)}</div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-xs text-green-500">+12% vs last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="border-muted/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Pipeline by Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              {stageData.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {stageData.map((stage) => (
                    <div key={stage.name} className="space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                        <span className="font-medium truncate">{stage.name}</span>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                          <span className="text-muted-foreground">{stage.value}</span>
                          <span className="font-semibold">{formatCurrency(stage.amount)}</span>
                        </div>
                      </div>
                      <div className="h-2.5 sm:h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${(stage.amount / Math.max(...stageData.map(s => s.amount))) * 100}%`,
                            backgroundColor: STAGE_COLORS[stage.name as keyof typeof STAGE_COLORS]
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No pipeline data yet</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Revenue by Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              {revenueData.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {revenueData.map((item) => {
                    const maxValue = Math.max(...revenueData.map(d => d.value));
                    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    return (
                      <div key={item.stage} className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div 
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: STAGE_COLORS[item.stage as keyof typeof STAGE_COLORS] }}
                            />
                            <span className="text-xs sm:text-sm font-medium truncate">{item.stage}</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs sm:text-sm font-bold">${item.value.toFixed(0)}K</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">{item.deals} deals</p>
                          </div>
                        </div>
                        <div className="h-2.5 sm:h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: STAGE_COLORS[item.stage as keyof typeof STAGE_COLORS]
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No revenue data yet</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted/40 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Monthly Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            {monthlyGrowth && monthlyGrowth.length > 0 ? (
              <div className="space-y-6">
                <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                  <div className="pt-24 pb-2">
                    <div className="grid grid-cols-6 gap-2 sm:gap-4 h-64 min-w-[400px] md:min-w-0">
                      {monthlyGrowth.map((month, index) => {
                        const maxRevenue = Math.max(...monthlyGrowth.map(m => m.revenue), 1);
                        const heightPercentage = (month.revenue / maxRevenue) * 100;
                        
                        const colors = [
                          'from-violet-500 to-purple-600',
                          'from-blue-500 to-cyan-600',
                          'from-emerald-500 to-green-600',
                          'from-amber-500 to-orange-600',
                          'from-rose-500 to-pink-600',
                          'from-indigo-500 to-blue-600'
                        ];
                        
                        return (
                          <div key={month.month} className="flex flex-col items-center justify-end h-full group">
                            <div className="relative w-full h-full flex items-end">
                              <div 
                                className={`w-full rounded-t-lg sm:rounded-t-xl bg-gradient-to-t ${colors[index % colors.length]} transition-all duration-500 hover:scale-105 hover:shadow-xl relative`}
                                style={{ height: `${Math.max(heightPercentage, 8)}%` }}
                              >
                                <div className="absolute inset-0 bg-white/10 rounded-t-lg sm:rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="absolute -top-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 pointer-events-none">
                                  <div className="bg-gray-900 text-white px-3 sm:px-4 py-2 rounded-lg shadow-2xl whitespace-nowrap">
                                    <p className="text-xs sm:text-sm font-bold">{formatCurrency(month.revenue)}</p>
                                    <p className="text-[10px] sm:text-xs text-gray-300">{month.wonDeals} deals closed</p>
                                  </div>
                                  <div className="w-3 h-3 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-2 sm:mt-3 text-center">
                              <p className="text-xs sm:text-sm font-semibold text-foreground">{month.month.split(' ')[0]}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{month.wonDeals}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border/50">
                  <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                    <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      {formatCurrency(monthlyGrowth.reduce((sum, m) => sum + m.revenue, 0))}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Total Revenue (6mo)</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {monthlyGrowth.reduce((sum, m) => sum + m.wonDeals, 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Deals Closed (6mo)</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                    <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      {monthlyGrowth.length > 1 && monthlyGrowth[monthlyGrowth.length - 2]!.revenue > 0
                        ? `${Math.round(((monthlyGrowth[monthlyGrowth.length - 1]!.revenue - monthlyGrowth[monthlyGrowth.length - 2]!.revenue) / monthlyGrowth[monthlyGrowth.length - 2]!.revenue) * 100)}%`
                        : '0%'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">MoM Growth</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No growth data yet</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-8">
        <Card className="lg:col-span-4 border-muted/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Recent Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentContacts?.slice(0, 5).map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold border border-primary/10">
                      {contact.firstName[0]}{contact.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {contact.firstName} {contact.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                  {contact.company && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {contact.company.name}
                    </span>
                  )}
                </div>
              ))}
              {(!recentContacts || recentContacts.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-3 opacity-30" />
                  <p className="mb-2">No contacts yet</p>
                  <Link href="/contacts">
                    <Button className="mt-4" size="sm">Add your first contact</Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-muted/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Upcoming Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div>
                  <p className="text-sm font-medium">Completion Rate</p>
                  <p className="text-xs text-muted-foreground">Current period</p>
                </div>
                <div className="text-3xl font-bold text-primary">{activityCompletionRate}%</div>
              </div>
              
              {upcomingActivities?.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`h-2 w-2 rounded-full mt-2 ${activity.completed ? 'bg-green-500' : 'bg-primary'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.dueDate
                        ? new Date(activity.dueDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "No due date"}
                    </p>
                  </div>
                </div>
              ))}
              {overdueActivities && overdueActivities.length > 0 && (
                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-destructive">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {overdueActivities.length} overdue activities
                    </span>
                  </div>
                </div>
              )}
              {(!upcomingActivities || upcomingActivities.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-16 w-16 mx-auto mb-3 opacity-30" />
                  <p>No upcoming activities</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top Deals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deals?.slice(0, 6).map((deal, index) => (
              <div key={deal.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{deal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {deal.company?.name ?? deal.contact?.firstName + " " + deal.contact?.lastName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatCurrency(deal.value)}</p>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ 
                        backgroundColor: STAGE_COLORS[deal.stage as keyof typeof STAGE_COLORS] + '20',
                        color: STAGE_COLORS[deal.stage as keyof typeof STAGE_COLORS]
                      }}
                    >
                      {deal.stage}
                    </span>
                    <span className="text-xs text-muted-foreground">{deal.probability}%</span>
                  </div>
                </div>
              </div>
            ))}
            {(!deals || deals.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-16 w-16 mx-auto mb-3 opacity-30" />
                <p className="mb-2">No deals yet</p>
                <Link href="/deals">
                  <Button className="mt-4" size="sm">Create your first deal</Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const isMobile = useIsMobile();

  return (
    <AppLayout>
      {isMobile ? <MobileDashboard /> : <DesktopDashboard />}
    </AppLayout>
  );
}
