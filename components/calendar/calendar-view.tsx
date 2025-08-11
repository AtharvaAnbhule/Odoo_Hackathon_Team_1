"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Package } from "lucide-react";
import {
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import type { Booking } from "@/lib/types";

interface CalendarViewProps {
  bookings: Booking[];
}

export function CalendarView({ bookings }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking) => {
      const startDate = parseISO(booking.startDate);
      const endDate = parseISO(booking.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "picked-up":
        return "bg-orange-100 text-orange-800";
      case "returned":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const selectedDateBookings = getBookingsForDate(selectedDate);
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const hasBookingsOnDate = (date: Date) => {
    return getBookingsForDate(date).length > 0;
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{
                hasBooking: (date) => hasBookingsOnDate(date),
              }}
              modifiersStyles={{
                hasBooking: {
                  backgroundColor: "#dbeafe",
                  color: "#1e40af",
                  fontWeight: "bold",
                },
              }}
              className="rounded-md border"
            />
            <div className="mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                <span>Days with bookings</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{format(selectedDate, "EEEE, MMMM d, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateBookings.length > 0 ? (
              <div className="space-y-4">
                {selectedDateBookings.map((booking) => (
                  <div key={booking.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{booking.productName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(booking.startDate), "MMM d")} -{" "}
                          {format(parseISO(booking.endDate), "MMM d")}
                        </p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        Qty: {booking.quantity}
                      </div>
                      <div>₹{booking.totalPrice}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No bookings</h3>
                <p className="text-muted-foreground text-sm">
                  No bookings scheduled for this date
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="font-semibold p-2">
                {day}
              </div>
            ))}
            {monthDays.map((day) => {
              const dayBookings = getBookingsForDate(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 border rounded cursor-pointer hover:bg-accent ${
                    isSameDay(day, selectedDate)
                      ? "bg-primary text-primary-foreground"
                      : ""
                  } ${dayBookings.length > 0 ? "bg-blue-50" : ""}`}
                  onClick={() => setSelectedDate(day)}>
                  <div className="font-medium">{format(day, "d")}</div>
                  {dayBookings.length > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      {dayBookings.length} booking(s)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
