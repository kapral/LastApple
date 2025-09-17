using System.Net;

namespace LastApple.Web.Exceptions;

public class UnauthorizedException(string message = "Unauthorized access.") 
    : HttpException(message, HttpStatusCode.Unauthorized)
{
}